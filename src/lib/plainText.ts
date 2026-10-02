// 本人に届く文章は必ずプレーンテキスト（CLAUDE.md のルール）。
// supabase/functions/handle-inquiry/index.ts の stripMarkdown と同じ処理（Edge Function とは共有できないため写し）
export const stripMarkdown = (s: string) =>
  s
    .replace(/\*\*|__|`/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '・');
