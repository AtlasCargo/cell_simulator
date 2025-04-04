use nalgebra::Vector3;
use rand::Rng;
use serde::{Serialize, Deserialize};
use rayon::prelude::*;
use std::fs::File;
use std::io::Write;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lipid {
    pub pos: Vector3<f32>,
    pub vel: Vector3<f32>,
    pub force: Vector3<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Protein {
    pub pos: Vector3<f32>,
    pub radius: f32,
}

pub struct Simulation {
    pub lipids: Vec<Lipid>,
    pub proteins: Vec<Protein>,
    pub dt: f32,
}

impl Simulation {
    pub fn new(n: usize) -> Self {
        let mut rng = rand::thread_rng();
        let mut lipids = Vec::with_capacity(n);
        for i in 0..n {
            let is_upper = i % 2 == 0;
            let base_z = if is_upper { 0.5 } else { -0.5 };
            let pos = Vector3::new(
                rng.gen_range(-2.0..2.0),
                rng.gen_range(-2.0..2.0),
                base_z + rng.gen_range(-0.1..0.1),
            );
            lipids.push(Lipid {
                pos,
                vel: Vector3::zeros(),
                force: Vector3::zeros(),
            });
        }

        let proteins = vec![
            Protein { pos: Vector3::new(0.0, 0.0, 0.0), radius: 0.3 },
            Protein { pos: Vector3::new(1.0, 1.0, 0.0), radius: 0.25 },
        ];

        Self { lipids, proteins, dt: 0.01 }
    }

    pub fn step(&mut self) {
        let n = self.lipids.len();
        for l in &mut self.lipids {
            l.force = Vector3::zeros();
        }

        let cutoff = 0.5;
        let strength = 0.01;

        for i in 0..n {
            for j in (i+1)..n {
                let dir = self.lipids[i].pos - self.lipids[j].pos;
                let dist = dir.norm();
                if dist < cutoff && dist > 1e-5 {
                    let force_mag = strength * (1.0 / dist - 1.0 / cutoff);
                    let force = dir.normalize() * force_mag;
                    self.lipids[i].force += force;
                    self.lipids[j].force -= force;
                }
            }
        }

        for lipid in &mut self.lipids {
            lipid.vel += lipid.force * self.dt;
            lipid.pos += lipid.vel * self.dt;
        }
    }

    pub fn export_positions(&self) -> Vec<[f32; 3]> {
        self.lipids.iter().map(|l| l.pos.into()).collect()
    }

    pub fn save_frame<P: AsRef<Path>>(&self, path: P) -> std::io::Result<()> {
        #[derive(Serialize)]
        struct Frame {
            lipids: Vec<[f32; 3]>,
            proteins: Vec<([f32; 3], f32)>,
        }

        let frame = Frame {
            lipids: self.export_positions(),
            proteins: self.proteins.iter().map(|p| (p.pos.into(), p.radius)).collect(),
        };

        let json = serde_json::to_string_pretty(&frame)?;
        let mut file = File::create(path)?;
        file.write_all(json.as_bytes())?;
        Ok(())
    }
}
