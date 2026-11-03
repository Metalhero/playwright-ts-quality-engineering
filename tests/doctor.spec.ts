import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';

// This test ensures that the doctor script can be run from a different working directory than the project root.
test('doctor works from another working directory', ({ }, testInfo) => {
    const projectRoot = resolve(testInfo.config.rootDir, '..');
    const scriptPath = resolve(projectRoot, 'scripts/doctor.mjs');

    const result = spawnSync(
        process.execPath,
        [scriptPath, '--verbose'],
        {
            cwd: tmpdir(),
            encoding: 'utf8',
            timeout: 10_000,
        }
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Project preflight: OK');
});

// This test ensures that the doctor script does not print the value of TEST_BASE_URL even if it is set in the environment. 
// This is important for security reasons, as the value of TEST_BASE_URL may contain sensitive information.
test('doctor does not print TEST_BASE_URL value', ({ }, testInfo) => {
    const projectRoot = resolve(testInfo.config.rootDir, '..');
    const scriptPath = resolve(projectRoot, 'scripts/doctor.mjs');

    const marker = 'TEST_MARKER_123';

    const result = spawnSync(process.execPath, [scriptPath], {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 5_000,
        env: {
            ...process.env,
            TEST_BASE_URL: marker,
        },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).not.toContain(marker);
    expect(result.stderr).not.toContain(marker);
});

// This test ensures that the doctor script fails when package-lock.json is missing.
test('doctor fails when package-lock.json is missing', ({ }, testInfo) => {
    const projectRoot = resolve(testInfo.config.rootDir, '..');
    const tempRoot = mkdtempSync(join(tmpdir(), 'doctor-test-'));

    try {
        // copy the doctor script to the temporary project
        const sourceScript = join(projectRoot, 'scripts', 'doctor.mjs');
        const targetScript = join(tempRoot, 'scripts', 'doctor.mjs');

        mkdirSync(dirname(targetScript), { recursive: true });
        copyFileSync(sourceScript, targetScript);

        const requiredFiles = [
            'package.json',
            'playwright.config.ts',
            'tsconfig.json',
            'tests/todo.spec.ts',
        ];

        for (const file of requiredFiles) {
            const filePath = join(tempRoot, file);

            mkdirSync(dirname(filePath), { recursive: true });
            writeFileSync(filePath, '');
        }

        const result = spawnSync(process.execPath, [targetScript], {
            cwd: tempRoot,
            encoding: 'utf8',
            timeout: 10_000,
        });

        expect(result.error).toBeUndefined();
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('package-lock.json');
    } finally {
        rmSync(tempRoot, { recursive: true, force: true });
    }
});