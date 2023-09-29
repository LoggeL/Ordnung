<script>
  import "../app.postcss";
  import Fa from "svelte-fa/src/fa.svelte";
  import logo from "$lib/images/logo.png";

  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  import { faBars } from "@fortawesome/free-solid-svg-icons";
  import { AppShell, AppBar, Drawer } from "@skeletonlabs/skeleton";

  import { TreeView } from "@skeletonlabs/skeleton";

  import { initializeStores } from "@skeletonlabs/skeleton";

  initializeStores();

  import { getDrawerStore } from "@skeletonlabs/skeleton";

  import { collections } from './stores'

  const drawerStore = getDrawerStore();

  // Pocketbase
  import { pbStore } from "svelte-pocketbase";
  // import { PUBLIC_POCKETBASE_URL } from '$env/static/public'
  const PUBLIC_POCKETBASE_URL = "https://ordnungdb.logge.top";

  pbStore.set(PUBLIC_POCKETBASE_URL);

  import { onMount } from "svelte";

  let nodes = { name: "Ordnung", children: [], open: false };

  const year = new Date().getFullYear();

  let badges = [];

  if ($page.url.pathname.startsWith("/grid")) {
    badges = $page.url.pathname.replace("/grid/", "").split("_");

    let linkElements = [];
    badges = badges.map((e) => {
      linkElements.push(e);
      return {
        content: e.charAt(0).toUpperCase() + e.slice(1),
        link: `/grid/${linkElements.join("_")}`,
      };
    });
  }

  onMount(async () => {
    nodes = await getCollections();
  });

  async function getCollections() {
    let treeStructured = {
      content: "Ordnung",
      children: [],
      open: false,
    };

    $pbStore.autoCancellation(false);
    await $pbStore.admins.authWithPassword("logge@duck.com", "404noswagfound");

    const collectionList = await $pbStore.collections.getFullList()
    collections.set(collectionList)
    const treeFlat = collectionList
      .map((e) => e.name)
      .sort();

    // Turn into {content: "content", children: []} format
    treeFlat.forEach((e) => {
      let current = treeStructured;
      e.split("_").forEach((category) => {
        if (current.children.find((g) => g.content === category)) {
          current = current.children.find((g) => g.content === category);
        } else {
          current.children.push({
            content: category,
            children: [],
            value: e,
            open: false,
          });
          current = current.children[current.children.length - 1];
        }
      });
    });

    return treeStructured;
  }

  function resetNodeTree(node) {
    node.checked = false;
    node.open = false;
    for (let i = 0; i < node.children.length; i++) {
      resetNodeTree(node.children[i]);
    }
  }

  function scanForNavigation(node) {
    for (let i = 0; i < node.children.length; i++) {
      if (!node.children[i].checked) continue;
      if (node.children[i].children.length === 0) {
        // Navigate to node.children[i].value

        goto(`/grid/${node.children[i].value}`);

        // Uncheck all nodes
        resetNodeTree(nodes);

        // Close drawer
        drawerStore.close();

        return;
      } else {
        scanForNavigation(node.children[i]);
      }
    }
  }
</script>

<!-- App Shell -->
<AppShell>
  <svelte:fragment slot="header">
    <!-- App Bar -->
    <AppBar>
      <svelte:fragment slot="lead">
        <button
          on:click={() => {
            drawerStore.open();
          }}
          class="cursor-pointer prose"
          aria-label="Open Drawer"
        >
          <Fa icon={faBars} />
        </button>
        <img src={logo} alt="Logo" class="h-6 float-left mr-1 ml-3" />
        Ordnung
        {#if $page.url.pathname.startsWith("/grid")}
          -
          {#each $page.url.pathname
            .replace("/grid/", "")
            .split("_")
            .map((e) => e.charAt(0).toUpperCase() + e.slice(1)) as category, i}
            <a href={`/grid/${$page.url.pathname.split("/grid/")[1]?.split("_").slice(0, i + 1).join("_")}`} on:click={() => setTimeout(() => window.location.reload())}>
              <span class="chip variant-filled ml-1">{category}</span>
            </a>
          {/each}
        {/if}
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <!-- Page Route Content -->
  <slot />

  <!-- Footer -->
  <svelte:fragment slot="pageFooter">
    <div class="w-full flex">
      <span
        class="m-auto bg-gradient-to-br from-blue-100 to-cyan-400 bg-clip-text text-transparent box-decoration-cl"
      >
        &copy; <a class="font-bold" target="_blank" href="https://lmf.logge.top"
          >LMF</a
        >
        {year}
      </span>
    </div>
  </svelte:fragment>
</AppShell>

<!-- Drawer -->
<Drawer>
  <!-- Heading -->
  <AppBar>Ordnung - Categories</AppBar>

  <!-- Tree View -->
  <TreeView
    bind:nodes={nodes.children}
    on:change={(e) => {
      // Scan for children which are checked but don't have children
      scanForNavigation(nodes);
    }}
    selection
  />
</Drawer>
