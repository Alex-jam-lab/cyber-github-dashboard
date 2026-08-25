/**
 * github.js
 * GitHub API 服务封装：用户信息 / 仓库 / 语言占比 / 事件流 / 贡献矩阵
 * 所有请求带独立 token 参数，避免 Node 环境默认代理导致的请求失败。
 */

const API_BASE = 'https://api.github.com'
const CONTRIB_BASE = 'https://github-contributions-api.jogruber.de/v4'

// 自定义错误类型，方便组件侧做友好提示
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(url, { token = null, silent = false } = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token) headers.Authorization = `Bearer ${token}`
  // 指向 GitHub 官方上传接口，解决浏览器跨域问题
  const proxy = 'https://cors.isomorphic-git.org/'
  const isContrib = url.startsWith(CONTRIB_BASE)
  const target = isContrib ? url : proxy + url

  try {
    const res = await fetch(target, { headers })
    if (res.status === 404) {
      throw new ApiError('404_NOT_FOUND', 404)
    }
    if (res.status === 403) {
      const remaining = res.headers.get('x-ratelimit-remaining')
      throw new ApiError(
        remaining === '0' ? 'RATE_LIMITED' : 'RATE_LIMIT_SOON',
        403
      )
    }
    if (!res.ok) {
      throw new ApiError(`HTTP_${res.status}`, res.status)
    }
    return await res.json()
  } catch (err) {
    if (err instanceof ApiError) throw err
    // 网络/跨域失败
    if (!silent && !isContrib) {
      try {
        const fallback = await fetch(url, { headers })
        if (fallback.ok) return await fallback.json()
      } catch (_) {
        /* ignore fallback failure */
      }
    }
    throw new ApiError('NETWORK', 0)
  }
}

/** 获取用户公开信息 */
export async function fetchUser(username, token) {
  return request(`${API_BASE}/users/${username}`, { token })
}

/** 获取用户公开仓库（用于语言占比） */
export async function fetchRepos(username, token) {
  const repos = []
  let page = 1
  while (page <= 10) {
    const batch = await request(
      `${API_BASE}/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
      { token }
    )
    repos.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return repos
}

/** 计算前 N 大语言占比 */
export function computeLanguages(repos) {
  const langBytes = {}
  repos.forEach((r) => {
    if (!r.language) return
    langBytes[r.language] = (langBytes[r.language] || 0) + (r.size || 0)
  })
  const total = Object.values(langBytes).reduce((a, b) => a + b, 0)
  const rows = Object.entries(langBytes)
    .map(([name, bytes]) => ({
      name,
      value: total ? Math.round((bytes / total) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.value - a.value)
  return {
    top: rows.slice(0, 5),
    rest: rows.slice(5)
  }
}

/** 获取用户公开事件流（Commit / Push 动态） */
export async function fetchEvents(username, token) {
  const events = await request(
    `${API_BASE}/users/${username}/events/public?per_page=30`,
    { token }
  )
  return events.filter(
    (e) =>
      e.type === 'PushEvent' ||
      e.type === 'CreateEvent' ||
      e.type === 'PullRequestEvent' ||
      e.type === 'IssuesEvent' ||
      e.type === 'WatchEvent' ||
      e.type === 'ForkEvent' ||
      e.type === 'ReleaseEvent'
  )
}

/** 从事件流解析为终端风格活动行 */
export function parseActivity(events, username) {
  const timeAgo = (iso) => {
    const sec = Math.floor((Date.now() - new Date(iso)) / 1000)
    if (sec < 60) return `${sec}s`
    if (sec < 3600) return `${Math.floor(sec / 60)}m`
    if (sec < 86400) return `${Math.floor(sec / 3600)}h`
    return `${Math.floor(sec / 86400)}d`
  }
  return events.slice(0, 5).map((e, i) => {
    const repo = (e.repo && e.repo.name) || 'unknown/repo'
    const ago = timeAgo(e.created_at)
    if (e.type === 'PushEvent') {
      const commits = e.payload && e.payload.commits
      const msg = commits && commits.length
        ? commits.map((c) => c.message.split('\n')[0]).join(' · ')
        : 'push'
      return {
        kind: 'commit',
        index: i,
        line: `[commit] ${repo} → ${msg}`,
        ago
      }
    }
    if (e.type === 'CreateEvent') {
      const refType = (e.payload && e.payload.ref_type) || 'ref'
      const ref = (e.payload && e.payload.ref) || ''
      return {
        kind: 'create',
        index: i,
        line: `[create] ${repo} +${refType} ${ref}`,
        ago
      }
    }
    if (e.type === 'PullRequestEvent') {
      const action = (e.payload && e.payload.action) || 'opened'
      const n = e.payload && e.payload.pull_request && e.payload.pull_request.number
      return {
        kind: 'pr',
        index: i,
        line: `[PR #${n}] ${repo} ${action}`,
        ago
      }
    }
    if (e.type === 'IssuesEvent') {
      const action = (e.payload && e.payload.action) || 'opened'
      const n = e.payload && e.payload.issue && e.payload.issue.number
      return {
        kind: 'issue',
        index: i,
        line: `[issue #${n}] ${repo} ${action}`,
        ago
      }
    }
    if (e.type === 'WatchEvent') {
      return { kind: 'star', index: i, line: `[star] ${repo} ⭐`, ago }
    }
    if (e.type === 'ForkEvent') {
      return { kind: 'fork', index: i, line: `[fork] ${repo} ← cloned`, ago }
    }
    if (e.type === 'ReleaseEvent') {
      return {
        kind: 'release',
        index: i,
        line: `[release] ${repo} ${(e.payload && e.payload.release && e.payload.release.tag_name) || ''}`,
        ago
      }
    }
    return { kind: 'event', index: i, line: `[event] ${repo} ${e.type}`, ago }
  })
}

/** 贡献矩阵：调用 jogruber 第三方 API（带 cors.isomorphic-git 代理） */
export async function fetchContributions(username) {
  const data = await request(`${CONTRIB_BASE}/${encodeURIComponent(username)}?y=last`, {
    silent: true
  })
  if (data && data.total) {
    // API 可选参数：years=last 只返回最近一年
    return {
      total: data.total.last || 0,
      days: data.contributions || []
    }
  }
  return { total: 0, days: [] }
}

/** 一键并发拉取全部看板数据，任一失败立即抛出并提示 */
export async function fetchAllDashboardData(username, token = null) {
  const [user, repos, events, contrib] = await Promise.all([
    fetchUser(username, token),
    fetchRepos(username, token),
    fetchEvents(username, token),
    fetchContributions(username)
  ])
  const { top, rest } = computeLanguages(repos)
  const stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0)
  return {
    user,
    repoCount: repos.length,
    stars,
    languages: top,
    otherLanguages: rest,
    activities: parseActivity(events, username),
    contributions: contrib
  }
}
