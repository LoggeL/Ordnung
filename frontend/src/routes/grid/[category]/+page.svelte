<script>
  import AgGridSvelte from "ag-grid-svelte";
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-alpine.css";

  // Connect to PocketBase Backend
  import { pbStore } from "svelte-pocketbase";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  const blacklisted = ["collectionId", "collectionName", "expand", "id"];

  $: category = $page.params.category;

  /**
   * @type {{ field: string; }[]}
   */
  let columnDefs = [];
  /**
   * @type {{ field: string; }[]}
   */
  let rowData = [];
  let loaded = false;
  let subCategories = [];

  function onCellValueChanged(event) {
    console.log(event);

    return true
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  async function getGridData() {
    
    console.log("getting grid data", category);
    $pbStore.autoCancellation(false);
    await $pbStore.admins.authWithPassword("logge@duck.com", "404noswagfound");

    $pbStore
      .collection(category)
      .getFullList()
      .then((data) => {
        console.log(data);
        // Get column names
        columnDefs = Object.keys(data[0])
          .map((e) => {
            if (blacklisted.includes(e)) return null;
            return {
              field: e,
              filter: "agTextColumnFilter",
              sortable: true,
              editable: true,
            };
          })
          .filter((e) => e !== null);

        // If it has name, put it first
        columnDefs.sort((a, b) => {
          if (a.field === "name") return -1;
          if (b.field === "name") return 1;
          return 0;
        });

        // Get row data
        rowData = data.map((e) => {
          return { ...e };
        });

        loaded = true;
      }).catch(async (e) => {
        console.error(e)
        // Category doesn't exist, we show cards instead
        const categories = await $pbStore.collections.getFullList()

        subCategories = categories.filter((e) => e.name.startsWith(category)).map(e => {
          const removedName = e.name.replace(category + '_', '')
          // Get next category
          const nextCategory = removedName.split('_')[0]
          return {
            displayName: capitalizeFirstLetter(nextCategory),
            link: `/grid/${category}_${nextCategory}`
          }
        })

        // only unique display names
        subCategories = subCategories.filter((e, i) => subCategories.findIndex((f) => f.displayName === e.displayName) === i)
      })
  }

  onMount(async () => {
    console.log("mounted");
    getGridData();
  });
</script>

<svelte:head>
  <title>Ordnung</title>
  <meta name="description" content="Ordnung DB" />
</svelte:head>

<section>
  {#if loaded}
    <div class="ag-theme-alpine-dark">
      <AgGridSvelte {columnDefs} {rowData} {onCellValueChanged} />
    </div>
  {:else if subCategories.length > 0}
    <h1>Subcategories for 
      {#each category.split('_') as subCategory}
        <span class="badge variant-filled ml-1">{capitalizeFirstLetter(subCategory)}</span> 
      {/each}
    </h1>
    <nav class="list-nav">
    <ul>
      {#each subCategories as subCategory}
      <li>
        <a href={subCategory.link} class="card m-4 p-4" on:click={() => {goto(subCategory.link); getGridData()}}>
          <span class="flex-auto">{capitalizeFirstLetter(subCategory.displayName)}</span>
      </li>
        {/each}
    </ul>
  </nav>
    {:else}
    <h1>Loading...</h1>
  {/if}
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
    height: calc(100vh - 56px - 24px);
    width: 100%;
  }
</style>
