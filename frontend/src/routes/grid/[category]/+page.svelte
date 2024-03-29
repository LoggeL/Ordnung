<script>
  import AgGridSvelte from "ag-grid-svelte";
  import "ag-grid-community/styles/ag-grid.css";
  import "ag-grid-community/styles/ag-theme-alpine.css";

  // Connect to PocketBase Backend
  import { pbStore } from "svelte-pocketbase";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  import { collections } from "../../stores";

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
  let pinnedTopRowData = [];

  let api;

  const defaultColDef = {
    filter: "agTextColumnFilter",
    sortable: true,
    editable: true,
  };

  const filterMap = {
    text: "agTextColumnFilter",
    number: "agNumberColumnFilter",
    date: "agDateColumnFilter",
    select: "agTextColumnFilter",
    url: "agTextColumnFilter",
    relation: "agTextColumnFilter",
  };

  const cellRendererMap = (type, params, schema) => {
    if (!type) return params.value;
    switch (type) {
      case "url":
        return params.value
          ? `<a class="btn btn-sm variant-filled w-full overflow-hidden" href="${
              params.value
            }" target="_blank">${
              new URL(params.value)?.host || params.value
            }</a>`
          : "";

      case "relation":
        const collection = collectionList.find(
          (e) => e.id === schema.options.collectionId
        );
        return params.value
          ? `<a class="btn btn-sm variant-filled w-full overflow-hidden" href="/grid/${collection.name}#${params.value}" target="_blank">${collection.name}</a>`
          : "";

      default:
        return params.value;
    }
  };

  let loaded = false;
  let subCategories = [];

  function onCellValueChanged(event) {
    console.log(event);
    // If it's rowPinned and name is "Add new", we don't save it
    if (event.rowPinned && event.data.name === "Add new") return;

    // If it's rowPinned create a new row and save it
    if (event.rowPinned) {
      console.log("creating new row");

      $pbStore
        .collection(category)
        .create(event.data)
        .then((data) => {
          console.log(data);
          event.data.id = data.id;
          event.data.collectionId = data.collectionId;
          event.data.collectionName = data.collectionName;
          event.data.expand = true;
          pinnedTopRowData = [
            {
              name: "Add new",
              expand: true,
              collectionId: data.collectionId,
              collectionName: data.collectionName,
            },
          ];
          rowData.unshift(data);
          api.setRowData(rowData);
          const rowNode = api.getDisplayedRowAtIndex(0);
          api.flashCells({
            rowNodes: [rowNode],
          });
          console.log(rowData);
        })
        .catch((e) => {
          console.error(e);
        });
      return;
    } else {
      // Normal update
      console.log("updating row");
      $pbStore
        .collection(category)
        .update(event.data.id, event.data)
        .then((data) => {
          console.log(data);
          api.flashCells({
            rowNodes: [event.node],
            columns: [event.column],
          });
        })
        .catch((e) => {
          console.error(e);
        });
    }

    return true;
  }

  function onGridReady() {
    // Check if we have a hash, then flash the row
    if (location.hash) {
      const hash = location.hash.replace("#", "");
      let rowNode = api.getDisplayedRowAtIndex(
        rowData.findIndex((e) => e.id === hash)
      );
      // Move to top
      rowData.unshift(rowData.splice(rowData.findIndex((e) => e.id === hash), 1)[0]);
      api.setRowData(rowData);

      rowNode = api.getDisplayedRowAtIndex(0);

      rowNode.setSelected(true);
      rowNode.setExpanded(true);
      api.flashCells({
        rowNodes: [rowNode],
      });
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  let collectionList;

  collections.subscribe((value) => {
    collectionList = value;
    getGridData();
  });

  async function getGridData() {
    subCategories = [];

    if (!category) return

    console.log("getting grid data", category);
    $pbStore.autoCancellation(false);
    await $pbStore.admins.authWithPassword("logge@duck.com", "404noswagfound");

    if (category === "+") {
      // Get all collections

      const topCategories = collectionList
        .filter((e) => e.name !== "users")
        .map((e) => e.name.split("_")[0])
        .filter((e, i, a) => a.indexOf(e) === i);

      subCategories = topCategories.map((e) => {
        return {
          displayName: capitalizeFirstLetter(e),
          link: `/grid/${e}`,
        };
      });

      return;
    }

    $pbStore
      .collection(category)
      .getFullList()
      .then((data) => {
        console.log(data);

        // Get collection schema
        const thisCollection = collectionList.find((e) => e.name === category);
        const schema = thisCollection.schema;

        console.log(schema);

        if (!data.length) return (loaded = true);

        // Get column names
        columnDefs = Object.keys(data[0])
          .map((e) => {
            if (blacklisted.includes(e)) return null;
            const thisSchema = schema.find((f) => f.name === e);
            return {
              field: e,
              filter: ["updated", "created"].includes(e)
                ? "agDateColumnFilter"
                : filterMap[thisSchema.type],
              cellEditor:
                thisSchema?.type === "select"
                  ? "agSelectCellEditor"
                  : undefined,
              cellEditorParams:
                thisSchema?.type === "select"
                  ? {
                      values: thisSchema?.options.values,
                    }
                  : undefined,
              cellRenderer: (params) =>
                cellRendererMap(thisSchema?.type, params, thisSchema),
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

        pinnedTopRowData = [
          {
            name: "Add new",
            expand: true,
            collectionId: thisCollection.id,
            collectionName: thisCollection.name,
          },
        ];

        loaded = true;
      })
      .catch(async (e) => {
        console.error(e);
        // Category doesn't exist, we show cards instead
        const categories = await $pbStore.collections.getFullList();

        subCategories = categories
          .filter((e) => e.name.startsWith(category))
          .map((e) => {
            const removedName = e.name.replace(category + "_", "");
            // Get next category
            const nextCategory = removedName.split("_")[0];
            return {
              displayName: capitalizeFirstLetter(nextCategory),
              link: `/grid/${category}_${nextCategory}`,
            };
          });

        // only unique display names
        subCategories = subCategories.filter(
          (e, i) =>
            subCategories.findIndex((f) => f.displayName === e.displayName) ===
            i
        );
      });
  }
</script>

<svelte:head>
  <title>Ordnung</title>
  <meta name="description" content="Ordnung DB" />
</svelte:head>

<section>
  {#if loaded}
    <div class="ag-theme-alpine-dark">
      <AgGridSvelte
        bind:api
        {columnDefs}
        {rowData}
        {pinnedTopRowData}
        {onCellValueChanged}
        {onGridReady}
        {defaultColDef}
      />
    </div>
  {:else if subCategories.length > 0}
    <h1>
      Subcategories for
      {#each category.split("_") as subCategory}
        <span class="badge variant-filled ml-1"
          >{capitalizeFirstLetter(subCategory)}</span
        >
      {/each}
    </h1>
    <nav class="list-nav">
      <ul>
        {#each subCategories as subCategory}
          <li>
            <a
              href={subCategory.link}
              class="card m-4 p-4"
              on:click={() => {
                goto(subCategory.link);
                getGridData();
              }}
            >
              <span class="flex-auto"
                >{capitalizeFirstLetter(subCategory.displayName)}</span
              >
            </a>
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
