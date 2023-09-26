<script>
  export let name = ''
  export let children = []
  export let indent = 0
  export let id = ''

  let open = false

  function toggleOpen() {
    open = !open
  }
</script>

{#if children.length === 0}
  <li style="padding-left: {indent}px">
    <a href={'grid/' + id}>
      {name}
    </a>
  </li>
{:else}
  <li style="padding-left: {indent}px" on:click={toggleOpen}>
    {`${name} (${children.length})`}
    {open ? '(-)' : '(+)'}
  </li>
{/if}

{#if open && children.length > 0}
  {#each children as child}
    <ul>
      <svelte:self {...child} indent={indent + 24} />
    </ul>
  {/each}
{/if}

<style>
  h3 {
    cursor: pointer;
    user-select: none;
  }
</style>
