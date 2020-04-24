use rusoto_s3::{GetObjectRequest, S3Client, S3};
use std::default::Default;
use std::fs::File;
use std::io::Write;

pub async fn get_object(client: S3Client, bucket: &str, key: &str) {
  let s3file = client
    .get_object(GetObjectRequest {
      bucket: bucket.to_owned(),
      key: key.to_owned(),
      ..Default::default()
    })
    .await
    .expect("failed");

  let mut stream = s3file.body.unwrap().into_async_read();
  // let mut body = Vec::new();
  // stream.read_to_end(&mut body).await.unwrap();

  let mut file = File::create("./tmp/test.mp4");
  // file.write_all(body).expect("failed to write body");
}
