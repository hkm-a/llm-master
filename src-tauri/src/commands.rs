use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct PythonEnvironment {
    installed: bool,
    version: Option<String>,
    path: Option<String>,
}

#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
pub async fn check_python_environment() -> PythonEnvironment {
    check_python_impl("python")
}

/// Core logic extracted for testability — runs `python --version` via the given binary name.
fn check_python_impl(python_bin: &str) -> PythonEnvironment {
    let result = Command::new(python_bin).arg("--version").output();

    match result {
        Ok(output) => {
            if output.status.success() {
                let version = String::from_utf8_lossy(&output.stdout)
                    .trim()
                    .to_string();
                PythonEnvironment {
                    installed: true,
                    version: Some(version),
                    path: None,
                }
            } else {
                PythonEnvironment {
                    installed: false,
                    version: None,
                    path: None,
                }
            }
        }
        Err(_) => PythonEnvironment {
            installed: false,
            version: None,
            path: None,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_app_version() {
        let version = get_app_version();
        assert!(!version.is_empty(), "version should not be empty");
        assert!(
            version.contains('.'),
            "version should be semver: {version}"
        );
    }

    #[test]
    fn test_check_python_not_found() {
        // Using a binary name that should not exist
        let result = check_python_impl("python_does_not_exist_xyz");
        assert!(!result.installed);
        assert!(result.version.is_none());
    }

    #[test]
    fn test_python_env_equality() {
        let not_found = check_python_impl("nonexistent_bin_12345");
        assert_eq!(
            not_found,
            PythonEnvironment {
                installed: false,
                version: None,
                path: None,
            }
        );
    }
}
