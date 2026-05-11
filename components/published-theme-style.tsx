/** Injects published brand CSS variables after globals.css defaults. */
export function PublishedThemeStyle({ css }: { css: string }) {
  if (!css.trim()) return null
  return <style id="published-site-theme" dangerouslySetInnerHTML={{ __html: css }} />
}
