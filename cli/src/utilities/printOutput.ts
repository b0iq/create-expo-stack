import { Toolbox } from 'gluegun/build/types/domain/toolbox';

import { getPackageManager } from './getPackageManager';
import { CliResults } from '../types';
import { copyBaseAssets } from './copyBaseAssets';

export async function printOutput(cliResults: CliResults, formattedFiles: any[], toolbox: Toolbox): Promise<void> {
	const {
		parameters: { options },
		print: { info, success, highlight },
		system
	} = toolbox;

	const { projectName, flags } = cliResults;

	// Output the results to the user
	info(``);
	highlight(`Initializing your project...`);

	await Promise.all(formattedFiles);

	info(``);
	highlight(`Copying base assets...`);
	await copyBaseAssets(projectName, toolbox);

	// check if npm option is set, otherwise set based on what the system is configure to use
	const packageManager = getPackageManager(toolbox);

	if (!options.noInstall && !flags.noInstall) {
		info(``);
		highlight(`Installing dependencies using ${packageManager}...`);
		info(``);

		// install with yarn or npm i
		await system.spawn(`cd ${projectName} && ${packageManager} install --silent`, {
			shell: true,
			stdio: 'inherit'
		});
	}

	info(``);
	highlight(`Cleaning up your project...`);

	// format the files
	await system.spawn(`cd ${projectName} && ${packageManager} run format`, {
		shell: true,
		stdio: 'inherit'
	});

	if (!options.noGit && !flags.noGit) {
		info(``);
		highlight(`Initializing git...`);
		info(``);

		// initialize git repo and add first commit
		await system.spawn(
			`cd ${projectName} && git init --quiet && git add . && git commit -m "Initial commit" -m "Generated by create-expo-stack 2.0.0." --quiet`,
			{
				shell: true,
				stdio: 'inherit'
			}
		);
	}

	//	check if packages includes package with name "supabase"
	if (cliResults.packages.some((pkg) => pkg.name === 'supabase')) {
		success(`Success! 🎉 Now, here's what's next:`);
		info(``);
		highlight('Head over to https://database.new to create a new Supabase project.');
		info(``);
		highlight(`Get the Project URL and anon key from the API settings:`);
		info(`1. Go to the API settings page in the Dashboard.`);
		info(`2. Find your Project URL, anon, and service_role keys on this page.`);
		info(`3. Copy these keys and paste them into your .env file.`);
		info(`4. Optionally, follow one of these guides to get started with Supabase:`);
		highlight(`https://docs.expo.dev/guides/using-supabase/#next-steps`);
		info(``);
		success(`Once you're done, run the following to get started: `);
		info(``);
	} else if (cliResults.packages.some((pkg) => pkg.name === 'firebase')) {
		success(`Success! 🎉 Now, here's what's next:`);
		info(``);
		highlight('Head over to https://console.firebase.google.com/ to create a new Firebase project.');
		info(``);
		highlight(`Get the API key and other unique identifiers:`);
		info(`1. Register a web app in your Firebase project:`);
		highlight(`https://firebase.google.com/docs/web/setup#register-app`);
		info(`2. Find your API key and other identifiers.`);
		info(`3. Copy these keys and paste them into your .env file.`);
		info(`4. Optionally, follow one of these guides to get started with Firebase:`);
		highlight(`https://docs.expo.dev/guides/using-firebase/#next-steps`);
		info(``);
		success(`Once you're done, run the following to get started: `);
		info(``);
	} else {
		success('Success! 🎉 Now, just run the following to get started: ');
		info(``);
	}
	info(`cd ${projectName}`);
	if (packageManager === 'npm') {
		if (options.noInstall) info('npm install');
		info('npm run ios');
	} else if (packageManager === 'pnpm') {
		if (options.noInstall) info('pnpm install');
		info('pnpm run ios');
	} else if (packageManager === 'bun') {
		if (options.noInstall) info('bun install');
		info('bun run ios');
	} else {
		if (options.noInstall) info('yarn install');
		info('yarn ios');
	}
	info(``);
}
