<script>
  // @ts-nocheck
  import Node from './Node.svelte'

  // Connect to PocketBase Backend
  import { pbStore } from 'svelte-pocketbase'
  import { onMount } from 'svelte'

  let tree = { name: 'Ordnung', children: [] }

  onMount(async () => {
    tree = await getCollections()
    console.log(tree)
  })

  //   onMount(async () => {
  async function getCollections() {
    let treeStructured = { name: 'Ordnung', children: [] }
    await $pbStore.admins.authWithPassword('logge@duck.com', '404noswagfound')

    const treeFlat = (await $pbStore.collections.getFullList())
      .map((e) => e.name)
      .sort()

    // Turn into {name: "name", children: []} format
    treeFlat.forEach((e) => {
      let current = treeStructured
      e.split('_').forEach((category) => {
        if (current.children.find((g) => g.name === category)) {
          current = current.children.find((g) => g.name === category)
        } else {
          current.children.push({ name: category, children: [], id: e })
          current = current.children[current.children.length - 1]
        }
      })
    })

    return treeStructured
  }
  //   })
</script>

<svelte:head>
  <title>Ordnung</title>
  <meta name="description" content="Ordnung DB" />
</svelte:head>

<section>
  {#if tree.children.length === 0}
    <h1>Loading...</h1>
  {:else}
    <ul>
      <Node {...tree} />
    </ul>
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
    max-height: calc(100vh - 52px - 44px - 32px);
  }
</style>
