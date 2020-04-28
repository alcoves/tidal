use clap;
use std::fs;
use std::process::Command;

mod parse;

pub fn run(matches: clap::ArgMatches) {
  println!("Parsing arguments");
  let args = parse::ConcatArgs::new(matches);

  println!(
    "Downloading segments: {} | {}",
    args.remote_segment_path.clone(),
    args.local_segment_path.clone()
  );
  Command::new("aws")
    .arg("s3")
    .arg("cp")
    .arg("--recursive")
    .arg(args.remote_segment_path.clone())
    .arg(args.local_segment_path.clone())
    .output()
    .unwrap();

  println!("Downloading source audio");
  Command::new("aws")
    .arg("s3")
    .arg("cp")
    .arg(args.remote_audio_path.clone())
    .arg(args.local_audio_path.clone())
    .output()
    .unwrap();

  println!("Creating manifest");
  let mut segment_list = vec![];
  let mut paths: Vec<_> = fs::read_dir(args.local_segment_path.clone())
    .unwrap()
    .map(|r| r.unwrap())
    .collect();
  paths.sort_by_key(|dir| dir.path());

  for path in paths {
    let seg_path =
      path.path().display().to_string().replace(&args.work_dir, ".");
    let ffmpeg_import = format!("file '{}'", seg_path);
    println!("{}", ffmpeg_import);
    segment_list.push(ffmpeg_import);
  }

  let joined = segment_list.join("\n");
  fs::write(args.manifest_path.clone(), joined).expect("Unable to write file");

  println!("Combining segments");
  let _ffmpeg_seg = Command::new("ffmpeg")
    .arg("-y")
    .arg("-f")
    .arg("concat")
    .arg("-safe")
    .arg("0")
    .arg("-i")
    .arg(args.manifest_path.clone())
    .arg("-c")
    .arg("copy")
    .arg(args.local_transcoded_no_audio_path.clone())
    .output()
    .unwrap();

  println!("Combining audio and video");
  let _ffmpeg_seg = Command::new("ffmpeg")
    .arg("-y")
    .arg("-i")
    .arg(args.local_transcoded_no_audio_path.clone())
    .arg("-i")
    .arg(args.local_audio_path.clone())
    .arg("-c:v")
    .arg("copy")
    .arg(args.local_transcoded_with_audio_path.clone())
    .output()
    .unwrap();

  println!("Uploading transcoded video");
  Command::new("aws")
    .arg("s3")
    .arg("cp")
    .arg(args.local_transcoded_with_audio_path.clone())
    .arg(args.remote_transcoded_path.clone())
    .output()
    .unwrap();

  println!("Concatination complete");
}
