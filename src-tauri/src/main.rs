#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::{fs, path::Path};
fn check_extension(path: &str, writing: bool) -> Result<(), String> {
    let extension = Path::new(path).extension().and_then(|x| x.to_str()).unwrap_or("").to_ascii_lowercase();
    if extension != "csv" && extension != "json" && !(writing && extension == "svg") { return Err("Kies een CSV- of JSON-bestand (SVG alleen bij opslaan).".into()); }
    Ok(())
}
#[tauri::command]
fn read_text(path: String) -> Result<String, String> {
    check_extension(&path, false)?;
    let metadata = fs::metadata(&path).map_err(|e| format!("Bestand niet bereikbaar: {e}"))?;
    if metadata.len() > 10 * 1024 * 1024 { return Err("Bestand is groter dan 10 MB.".into()); }
    fs::read_to_string(&path).map_err(|e| format!("Lezen mislukt: {e}"))
}
#[tauri::command]
fn write_text(path: String, text: String) -> Result<(), String> {
    check_extension(&path, true)?;
    if text.len() > 10 * 1024 * 1024 { return Err("Bestand is groter dan 10 MB.".into()); }
    fs::write(&path, text.as_bytes()).map_err(|e| format!("Opslaan mislukt. Controleer de map en toegangsrechten: {e}"))
}
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_text, write_text])
        .run(tauri::generate_context!())
        .expect("Rotoras Generator kon niet starten");
}
