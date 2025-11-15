// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::process::{Command, Child};
use std::sync::Mutex;

struct AppState {
    backend_process: Mutex<Option<Child>>,
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Start the FastAPI backend sidecar
            // TODO: Implement backend sidecar startup
            println!("Starting Daily Notes...");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

