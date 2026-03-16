export default function ThemeScript() {
  const code = `(function(){try{var key='theme';var stored=localStorage.getItem(key);var prefers=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var theme=(stored==='light'||stored==='dark')?stored:prefers;document.documentElement.setAttribute('data-theme',theme);}catch(e){}})();`
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
