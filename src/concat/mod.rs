use std::env;
use std::process::Command;
use std::{fs, io};

fn create_manifest() -> String {
    let path = "./tmp/concat-manifest.txt";
    let tmp_dir = String::from("./tmp");
    let seg_path = format!("{}/segments", tmp_dir);
    let mut segment_list = vec![];

    let mut paths: Vec<_> = fs::read_dir(seg_path).unwrap()
    .map(|r| r.unwrap())
    .collect();

    paths.sort_by_key(|dir| dir.path());

    for path in paths {
        let seg_path = path.path().display().to_string().replace(&tmp_dir, ".");
        let ffmpeg_import = format!("file '{}'", seg_path);
        println!("{}", ffmpeg_import);
        segment_list.push(ffmpeg_import);
    }

    let joined = segment_list.join("\n");
    fs::write(path, joined).expect("Unable to write file");

    return path.to_owned();
}

pub fn run(args: clap::ArgMatches) {
    println!("Invoking concatination pipeline");

    let tmp_dir = "./tmp";
    let segment_dir = format!("{}/transcoded", tmp_dir);

    let source_audio_path = "./tmp/test.wav";
    let out_audio_video_path = "./tmp/converted.mp4";
    let out_video_path = "./tmp/converted-no-audio.mp4";
    let manifest_path = create_manifest();

    println!("Concatinating segments");
    let _ffmpeg_seg = Command::new("ffmpeg")
        .arg("-y")
        .arg("-f")
        .arg("concat")
        .arg("-safe")
        .arg("0")
        .arg("-i")
        .arg(manifest_path)
        .arg("-c")
        .arg("copy")
        .arg(out_video_path)
        .output();

    println!("Adding source audio");
    let _ffmpeg_seg = Command::new("ffmpeg")
        .arg("-y")
        .arg("-i")
        .arg(out_video_path)
        .arg("-i")
        .arg(source_audio_path)
        .arg("-c:v")
        .arg("copy")
        .arg(out_audio_video_path)
        .output();

    // upload to wasabi cloud storage
    // update database with done status
}
