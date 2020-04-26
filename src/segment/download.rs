use std::process::Command;

pub async fn get_object(remote_source_path: &str, local_tmp_path: &str) {
  // TODO :: Assert remote_source_path matches s3://bucket/key format

  let res = Command::new("aws")
    .arg("s3")
    .arg("cp")
    .arg(remote_source_path)
    .arg(local_tmp_path)
    .output()
    .unwrap();

  println!("Downloaded source video: {}", res.status);
  // println!("stdout: {}", String::from_utf8_lossy(&res.stdout));
  // println!("stderr: {}", String::from_utf8_lossy(&res.stderr));
  assert!(res.status.success());
}
