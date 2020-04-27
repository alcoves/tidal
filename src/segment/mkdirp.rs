use std::fs;

// TODO :: Make global util
pub fn run(path: String) -> std::io::Result<()> {
  println!("Creating directory {}", path);
  fs::create_dir_all(path)?;
  Ok(())
}
