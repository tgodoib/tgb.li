<script lang="ts">
	import { ExternalLink, Trash2, Plus, LogOut } from 'lucide-svelte';
	import type { ActionData, PageServerData } from './$types';
	import { siGithub } from 'simple-icons';
	import { Toaster, toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	export let data: PageServerData;
	export let form: ActionData;

	let isLogged = 'username' in data;

	onMount(() => {
		if (form === null) return;
		if (form.status === 'success') toast.success(form.message);
		else toast.error(form.message);
	});
</script>

{#if form !== null}
	<div class="absolute">
		<Toaster />
	</div>
{/if}

{#if isLogged}
	<div class="card card-compact border w-[500px] bg-base-100">
		<div class="card-body flex-row justify-between items-center">
			<h1>{data.username}</h1>
			<form method="post" action="?/logout">
				<button><LogOut size={16} /></button>
			</form>
		</div>
	</div>
{:else}
	<a href="/login" class="btn w-[500px] flex justify-center gap-4 items-center">
		<svg role="img" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
			<title>{siGithub.title}</title>
			<path d={siGithub.path} />
		</svg>
		Login with Github
	</a>
{/if}

<div class="card bg-base-100 border w-[500px]">
	<div class="card-body">
		<h1 class="font-semibold pb-0">Add new entry</h1>

		<form method="post" action="?/add" class="flex gap-2 w-full" autocomplete="off">
			<input
				name="id"
				type="text"
				placeholder="id"
				class="input input-sm input-bordered w-[5em] placeholder-primary"
				disabled={!isLogged}
			/>
			<input
				name="url"
				type="url"
				placeholder="your link"
				class="input input-sm input-bordered flex-grow placeholder-primary"
				disabled={!isLogged}
			/>
			<button class="btn btn-sm btn-square" disabled={!isLogged}><Plus size={16} /></button>
		</form>

		<p class="text-xs text-primary mb-4">
			If an id is not provided, a randon one will be generated.
		</p>

		<table class="table">
			<thead>
				<tr>
					<th>id</th>
					<th class="w-[250px]">url</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#if isLogged}
					{#each data.urls as url}
						<!-- as Exclude<PageServerData["urls"], undefined> -->
						<tr>
							<td class="tooltip tooltip-bottom" data-tip={url.id}>
								<p class="max-w-[50px] truncate">
									{url.id}
								</p>
							</td>
							<td>
								<div data-tip={url.url}>
									<a href={url.url}>{url.url}</a><ExternalLink size={12} class="flex-shrink-0" />
								</div>
							</td>
							<td>
								<form method="post" action="?/del">
									<input type="hidden" name="id" value={url.id} />
									<button class="btn btn-ghost btn-xs"><Trash2 size={16} /></button>
								</form>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style lang="postcss">
	td > div > a {
		@apply link truncate;
	}
	td > div {
		@apply w-[250px] flex gap-2 items-center tooltip tooltip-right;
	}
	input {
		@apply disabled:text-neutral disabled:border-neutral;
	}
	button {
		@apply disabled:text-neutral disabled:border-neutral;
	}
</style>
