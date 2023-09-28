<script>
  import AgGridSvelte from "ag-grid-svelte";
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-alpine.css";

  // Connect to PocketBase Backend
  import { pbStore } from "svelte-pocketbase";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  const blacklisted = ["collectionId", "collectionName", "expand"];

  const { category } = $page.params;

  console.log("category", category);

  /**
   * @type {{ field: string; }[]}
   */
  let columnDefs = [];
  /**
   * @type {{ field: string; }[]}
   */
  let rowData = [];
  let loaded = false;

  function onCellValueChanged(event) {
    console.log(event);

    return true
  }

  onMount(async () => {
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
      });
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
