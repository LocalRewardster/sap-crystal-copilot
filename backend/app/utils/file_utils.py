"""
File utility functions for Crystal Copilot.
"""

import hashlib
import os
from pathlib import Path
from typing import Optional


def calculate_file_hash(file_path: Path) -> str:
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    
    with open(file_path, "rb") as f:
        # Read file in chunks to handle large files
        for chunk in iter(lambda: f.read(4096), b""):
            sha256_hash.update(chunk)
    
    return sha256_hash.hexdigest()


def ensure_directory_exists(directory: Path) -> None:
    """Ensure a directory exists, create if it doesn't."""
    directory.mkdir(parents=True, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Get file extension in lowercase."""
    return Path(filename).suffix.lower()


def is_valid_crystal_report(filename: str) -> bool:
    """Check if filename has valid Crystal Reports extension."""
    return get_file_extension(filename) == '.rpt'


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024.0 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"


def safe_filename(filename: str) -> str:
    """Generate a safe filename by removing/replacing problematic characters."""
    # Remove or replace problematic characters
    safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."
    safe_name = "".join(c if c in safe_chars else "_" for c in filename)
    
    # Ensure it doesn't start with a dot
    if safe_name.startswith('.'):
        safe_name = '_' + safe_name[1:]
    
    # Limit length
    if len(safe_name) > 255:
        name, ext = os.path.splitext(safe_name)
        safe_name = name[:255-len(ext)] + ext
    
    return safe_name


def get_unique_filename(directory: Path, filename: str) -> str:
    """Generate a unique filename in the given directory."""
    base_path = directory / filename
    
    if not base_path.exists():
        return filename
    
    # File exists, generate unique name
    name, ext = os.path.splitext(filename)
    counter = 1
    
    while True:
        new_filename = f"{name}_{counter}{ext}"
        new_path = directory / new_filename
        
        if not new_path.exists():
            return new_filename
        
        counter += 1