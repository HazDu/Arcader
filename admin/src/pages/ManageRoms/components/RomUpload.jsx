import { useState, useRef } from 'react';

const RomUpload = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragOut = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileSelect = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            await handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files) => {
        setUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('rom', file);

                const response = await fetch(`/api/roms/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': localStorage.getItem('adminToken') ? `Bearer ${localStorage.getItem('adminToken')}` : ''
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }
            }
            onUploadComplete();
        } catch (error) {
            console.error('Error uploading ROM:', error);
        }
        setUploading(false);
    };

    return (
        <div
            className={`upload-zone ${isDragging ? 'active' : ''}`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                multiple
            />
            {uploading ? (
                <div className="spinner"/>
            ) : (
                <div>
                    <p>Drag & drop ROM files here</p>
                    <p>or click to select files</p>
                </div>
            )}
        </div>
    );
};

export default RomUpload;