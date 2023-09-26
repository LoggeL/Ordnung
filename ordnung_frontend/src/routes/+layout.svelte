<script>
  import Header from './Header.svelte'
  import './styles.css'

  import { onMount } from 'svelte'

  import { pbStore } from 'svelte-pocketbase'
  // import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
  const PUBLIC_POCKETBASE_URL = 'https://ordnungdb.logge.top'

  pbStore.set(PUBLIC_POCKETBASE_URL)

  onMount(async () => {
    const year = new Date().getFullYear()
    const copyrightDate = document.getElementById('copyrightDate')

    if (copyrightDate) copyrightDate.innerText = year.toString()
  })
</script>

<div class="app">
  <Header />

  <main>
    <slot />
  </main>

  <footer>
    <p>
      &copy; <span id="copyrightDate">2023</span>
      <a href="https://lmf.logge.top">LMF</a>
    </p>
  </footer>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 12px 0;
    }
  }
</style>
