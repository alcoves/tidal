use clap;
use std::fs;
use serde_json;
use std::process::Command;
use serde::{Deserialize, Serialize};

mod parse;
mod mkdirp;
mod presets;
mod download;
mod dimensions;

#[derive(Serialize, Deserialize)]
struct TranscodingMessage {
  in_path: String,
  out_path: String,
  ffmpeg_cmd: String,
}

pub fn run(matches: clap::ArgMatches) {
  let args = parse::SegArgs::new(matches);

  download::get_object(&args.remote_source_path, &args.source_path);

  let _mk_dir_out = mkdirp::run(args.segment_path.clone());

  // TODO :: move to helper fn
  println!("Segmenting video with ffmpeg");
  let _ffmpeg_seg = Command::new("ffmpeg")
    .arg("-y")
    .arg("-i")
    .arg(args.source_path.clone())
    .arg("-c")
    .arg("copy")
    .arg("-f")
    .arg("segment")
    .arg("-segment_time")
    .arg("1")
    .arg("-an")
    .arg(format!("{}/{}", args.segment_path.clone(), "output_%06d.mkv"))
    .output();

  // TODO :: move to helper fn
  println!("Separating audio");
  let _ffmpeg_audio = Command::new("ffmpeg")
    .arg("-y")
    .arg("-i")
    .arg(args.work_dir.clone())
    .arg(args.source_audio_path.clone())
    .output();

  let dimensions = dimensions::get_dimensions(args.source_path.clone());
  let presets = presets::presets(dimensions[0]);

  // TODO :: create_thumbnail

  // Upload segments
  Command::new("aws")
  .arg("s3")
  .arg("cp")
  .arg("--recursive")
  .arg(args.segment_path.clone())
  .arg(args.remote_dest_path.clone())
  .output()
  .unwrap();

  let paths = fs::read_dir(args.segment_path.clone()).unwrap();

  // TODO :: Performance Improvements
  // Could combine items into a vector
  // for 10 items in the vector, make an sqs batch reuqest
  // Then invoke all requests async
  for path in paths {
    // get the last part of the string
    let segment_name = &path.unwrap().file_name().into_string().unwrap();

    for p in &presets {
      let in_path = format!("{}/{}", args.remote_dest_path.clone(), segment_name).to_owned();
      let out_path = format!("{}/{}", args.remote_dest_path.clone().replace("/source", &format!("/{}", p.name)), &segment_name);

      let msg_body = TranscodingMessage {
        in_path: in_path.to_owned(),
        out_path: out_path.to_owned(),
        ffmpeg_cmd: p.cmd.to_owned(),
      };

      let msg_body_string = serde_json::to_string(&msg_body).unwrap();
      println!("{:?}", msg_body_string);

      Command::new("aws")
      .arg("sqs")
      .arg("send-message")
      .arg("--queue-url")
      .arg(args.transcoding_queue_url.clone())
      .arg("--message-body")
      .arg(msg_body_string)
      .output()
      .unwrap();
    }
  }

  // TODO :: add concatination job to sqs queue
}
