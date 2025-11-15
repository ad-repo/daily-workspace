// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, AppHandle};
use tauri_plugin_shell::ShellExt;
use std::sync::{Arc, Mutex};
use std::time::Duration;

struct AppState {
    backend_port: Arc<Mutex<u16>>,
}

// Check if backend is healthy
async fn check_backend_health(port: u16) -> bool {
    let url = format!("http://127.0.0.1:{}/api/notes", port);
    match reqwest::get(&url).await {
        Ok(response) => response.status().is_success() || response.status().as_u16() == 404,
        Err(_) => false,
    }
}

// Find an available port
fn find_available_port() -> u16 {
    // For now, use fixed port 8000
    // TODO: Implement dynamic port finding if needed
    8000
}

#[tauri::command]
async fn get_backend_url(state: tauri::State<'_, AppState>) -> Result<String, String> {
    let port = *state.backend_port.lock().unwrap();
    Ok(format!("http://127.0.0.1:{}", port))
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let port = find_available_port();
            
            // Store the port in app state
            app.manage(AppState {
                backend_port: Arc::new(Mutex::new(port)),
            });
            
            // Get the sidecar command
            let sidecar_command = app.shell().sidecar("daily-notes-backend")
                .expect("failed to create sidecar command");
            
            // Spawn the backend process
            let (mut rx, _child) = sidecar_command
                .spawn()
                .expect("Failed to spawn sidecar");
            
            // Log output from the backend
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                            println!("[Backend] {}", String::from_utf8_lossy(&line));
                        }
                        tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                            eprintln!("[Backend Error] {}", String::from_utf8_lossy(&line));
                        }
                        tauri_plugin_shell::process::CommandEvent::Terminated(payload) => {
                            println!("[Backend] Process terminated with code: {:?}", payload.code);
                        }
                        _ => {}
                    }
                }
            });
            
            // Wait for backend to be ready
            let port_clone = port;
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                println!("Waiting for backend to start on port {}...", port_clone);
                for i in 0..30 {
                    tokio::time::sleep(Duration::from_secs(1)).await;
                    if check_backend_health(port_clone).await {
                        println!("Backend is ready!");
                        break;
                    }
                    if i == 29 {
                        eprintln!("Backend failed to start after 30 seconds");
                    }
                }
            });
            
            println!("Daily Notes started successfully!");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_backend_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

