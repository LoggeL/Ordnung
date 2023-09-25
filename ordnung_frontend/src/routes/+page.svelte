<script>
	import AgGridSvelte from 'ag-grid-svelte';
	import 'ag-grid-community/styles/ag-grid.css'; 
	import 'ag-grid-community/styles/ag-theme-alpine.css'; 
</script>

<svelte:head>
	<title>Grid</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<div class="ag-theme-alpine" style:width="100%" style:height="100%">
		<AgGridSvelte  />
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

	h1 {
		width: 100%;
	}
</style>
