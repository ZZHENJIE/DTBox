import { saveWindowState, restoreStateCurrent, StateFlags } from '@tauri-apps/plugin-window-state';
import { listen } from '@tauri-apps/api/event';

listen('tauri://window-created', () => {
    restoreStateCurrent(StateFlags.ALL).catch(error => {
        console.error('Tauri initialization failed:', error);
    });
});

listen('tauri://destroyed', () => {
    saveWindowState(StateFlags.ALL).catch(error => {
        console.error('Tauri cleanup failed:', error);
    });
});


