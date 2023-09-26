<script>
  import AgGridSvelte from 'ag-grid-svelte'
  import 'ag-grid-community/styles/ag-grid.css'
  import 'ag-grid-community/styles/ag-theme-alpine.css'

  // Connect to PocketBase Backend
  import { pbStore } from 'svelte-pocketbase'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'

  const category = $page.params.category

  const blacklisted = ['collectionId', 'collectionName', 'expand']

  /**
   * @type {{ field: string; }[]}
   */
  let columnDefs = []
  /**
   * @type {{ field: string; }[]}
   */
  let rowData = []

  onMount(async () => {
    await $pbStore.admins.authWithPassword('logge@duck.com', '404noswagfound')

    $pbStore
      .collection(category)
      .getFullList()
      .then((data) => {
        // Get column names
        columnDefs = Object.keys(data[0])
          .map((e) => {
            if (blacklisted.includes(e)) return null
            return { field: e }
          })
          .filter((e) => e !== null)

        // If it has name, put it first
        columnDefs.sort((a, b) => {
          if (a.field === 'name') return -1
          if (b.field === 'name') return 1
          return 0
        })

        // Get row data
        rowData = data.map((e) => {
          return { ...e }
        })
      })
  })
</script>

<svelte:head>
  <title>Ordnung</title>
  <meta name="description" content="Ordnung DB" />
</svelte:head>

<section>
  <div class="ag-theme-alpine">
    <AgGridSvelte {columnDefs} {rowData} />
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
  }

  div {
    height: calc(100vh - 52px - 80px);
    width: 100%;
  }
</style>
