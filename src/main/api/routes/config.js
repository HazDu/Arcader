import express from "express";
import { getConfig, updateConfig } from "../../utils/config";

const router = express.Router();

router.get("/", (req, res) => {
    try {
        const config = getConfig();
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/:section", (req, res) => {
    try {
        const section = req.params.section;
        const config = getConfig(section);
        res.json({ success: true, config });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/:section", (req, res) => {
    try {
        const section = req.params.section;
        const data = req.body;
        
        const success = updateConfig(section, data);
        
        if (success) {
            res.json({ 
                success: true, 
                message: `${section} configuration updated successfully`,
                config: getConfig(section)
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: `Failed to update ${section} configuration` 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;