// v2 version of Namo-500M-v2
// it uses Siglip2 as vision encoder and Qwen2.5 500M as llm
// the connector part is also very simple
// but we added a VLPatchMerger to siglip2 to reduce tokens

pub struct MMProjector {
    pub modules: Sequential,
}

impl MMProjector {
    pub fn load(vb: &VarBuilder, config: &LLaVAConfig) -> Result<Self> {
        if config.mm_projector_type == "linear" {
            let vb_prefix = if config.hf {
                "multi_modal_projector.linear_1"
            } else {
                "model.mm_projector.0"
            };
            let linear = linear(config.mm_hidden_size, config.hidden_size, vb.pp(vb_prefix))?;
            let modules = seq().add(linear);
            Ok(Self { modules })
        } else if let Some(mlp_depth) = mlp_gelu_match(&config.mm_projector_type) {
            let modules = if config.hf {
                let mut modules = seq().add(linear(
                    config.mm_hidden_size,
                    config.hidden_size,
                    vb.pp("multi_modal_projector.linear_1"),
                )?);
                for i in 1..mlp_depth {
                    modules = modules.add(Activation::Gelu).add(linear(
                        config.hidden_size,
                        config.hidden_size,
                        vb.pp(format!("multi_modal_projector.linear_{}", i + 1)),
                    )?);
                }
                modules
            } else {
                let mut modules = seq().add(linear(
                    config.mm_hidden_size,
                    config.hidden_size,
                    vb.pp("model.mm_projector.0"),
                )?);
                for i in 1..mlp_depth {
                    modules = modules.add(Activation::Gelu).add(linear(
                        config.hidden_size,
                        config.hidden_size,
                        vb.pp(format!("model.mm_projector.{}", i * 2)),
                    )?);
                }
                modules
            };
            Ok(Self { modules })
        } else if config.mm_projector_type == "identity" {
            Ok(Self {
                modules: seq().add(IdentityMap {}),
            })
        } else {
            bail!(
                "Unsupported MM projector type: {}",
                config.mm_projector_type
            )
        }
    }

    pub fn forward(&self, x: &Tensor) -> Result<Tensor> {
        self.modules.forward(x)
    }
}
