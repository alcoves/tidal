use std::process::Command;

pub async fn get_object(bucket: &str, key: &str, dest_path: &str) {
  let source_path = format!("s3://{}/{}", bucket, key);

  let output = Command::new("aws")
    .arg("s3")
    .arg("cp")
    .arg(source_path)
    .arg(dest_path)
    .output()
    .unwrap();

  println!("status: {}", output.status);
  println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
  println!("stderr: {}", String::from_utf8_lossy(&output.stderr));

  assert!(output.status.success());
}
