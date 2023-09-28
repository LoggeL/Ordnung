<script>
  import { goto } from "$app/navigation";

  import { onMount } from "svelte";

  onMount(() => {
    goto(`/grid/+`);
  });
</script>

<section>
  <h1>Redirecting...</h1>
</section>
