<script>
  import { page } from '$app/stores'

  import logo from '$lib/images/logo.png'
</script>

<header>
  <img src={logo} alt="Logo" />
  <span> Ordnung </span>
  <nav>
    <svg viewBox="0 0 2 3" aria-hidden="true">
      <path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
    </svg>
    <ul>
      <li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
        <a href="/">Categories</a>
      </li>
      <li
        aria-current={$page.url.pathname.startsWith('/grid')
          ? 'page'
          : undefined}
      >
        <a href="/grid">Grid</a>
      </li>
      <li
        aria-current={$page.url.pathname === '/settings' ? 'page' : undefined}
      >
        <a href="/settings">Settings</a>
      </li>
    </ul>
    <svg viewBox="0 0 2 3" aria-hidden="true">
      <path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
    </svg>
  </nav>
  <div class="hidden">
    <img src={logo} alt="Logo" />
    <span> Ordnung </span>
  </div>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
  }

  nav {
    margin: auto;
    display: flex;
    justify-content: center;
    --background: rgba(255, 255, 255, 0.7);
  }

  img {
    width: 2em;
    height: 2em;
    margin: 0.5em;
    display: block;
    float: left;
  }

  span {
    font-size: 1.5em;
    font-weight: 700;
    margin: 0.5em 0;
    display: block;
    float: left;
  }

  .hidden {
    opacity: 0;
  }

  /* Hide if screen small */
  @media (max-width: 480px) {
    img {
      display: none;
    }

    span {
      display: none;
    }
  }

  svg {
    width: 2em;
    height: 3em;
    display: block;
  }

  path {
    fill: var(--background);
  }

  ul {
    position: relative;
    padding: 0;
    margin: 0;
    height: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    background: var(--background);
    background-size: contain;
  }

  li {
    position: relative;
    height: 100%;
  }

  li[aria-current='page']::before {
    --size: 6px;
    content: '';
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: calc(50% - var(--size));
    border: var(--size) solid transparent;
    border-top: var(--size) solid var(--color-theme-1);
  }

  nav a {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 0.5rem;
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-decoration: none;
    transition: color 0.2s linear;
  }

  a:hover {
    color: var(--color-theme-1);
  }
</style>
