<script>
  // @ts-nocheck

  // Connect to PocketBase Backend
  import { pbStore } from 'svelte-pocketbase'
  import { onMount } from 'svelte'

  let tree = []

  onMount(async () => {
    await $pbStore.admins.authWithPassword('logge@duck.com', '404noswagfound')

    $pbStore.collections.getFullList().then((data) => {
      tree = data.map((e) => e.name).sort()
    })
  })
</script>

<svelte:head>
  <title>Ordnung</title>
  <meta name="description" content="Ordnung DB" />
</svelte:head>

<section>
  <ul>
    {#each tree as category}
      <li>
        <a href={`grid/${category}`}>
          {category}
        </a>
      </li>
    {/each}
  </ul>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }
</style>
