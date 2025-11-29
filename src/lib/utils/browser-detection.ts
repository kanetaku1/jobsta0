/**
 * インアプリブラウザを検出するユーティリティ関数
 * サーバーサイドとクライアントサイドの両方で使用可能
 */

export function isInAppBrowser(userAgent?: string): boolean {
  if (typeof window !== 'undefined' && !userAgent) {
    // クライアントサイド
    if (typeof navigator === 'undefined') return false
    userAgent = navigator.userAgent
  }
  
  if (!userAgent) return false
  
  const ua = userAgent.toLowerCase()
  
  // LINE / Facebook / Instagram / Twitter / Discord / Slack など代表的なインアプリブラウザを検知
  return (
    ua.includes('line') ||
    ua.includes('fbav') ||
    ua.includes('instagram') ||
    ua.includes('twitter') ||
    ua.includes('fban') ||
    ua.includes('fbios') ||
    ua.includes('messenger') ||
    ua.includes('wechat') ||
    ua.includes('micromessenger') ||
    ua.includes('qqbrowser') ||
    ua.includes('mqqbrowser') || 
    ua.includes('discord') ||
    ua.includes('discordbot') ||
    ua.includes('slack') ||
    ua.includes('slackbot')
  )
}

