use backend::Simulation;
use std::fs;
use std::path::Path;

fn main() {
    let mut sim = Simulation::new(200);
    let out_dir = Path::new("../frontend/snapshots");

    fs::create_dir_all(out_dir).unwrap();
    for frame in 0..60 {
        sim.step();
        let path = out_dir.join(format!("frame_{:05}.json", frame));
        sim.save_frame(&path).expect("Failed to save frame");
    }
}
