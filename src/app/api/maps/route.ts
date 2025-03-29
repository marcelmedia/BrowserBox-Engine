import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the maps directory path
    const mapsDir = path.join(process.cwd(), 'public', 'maps');

    // Read all directories in the maps folder (each directory is a map)
    const mapFolders = fs.readdirSync(mapsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Load metadata for each map
    const maps = mapFolders.map(folder => {
      try {
        const mapJsonPath = path.join(mapsDir, folder, 'map.json');
        if (fs.existsSync(mapJsonPath)) {
          const mapData = JSON.parse(fs.readFileSync(mapJsonPath, 'utf8'));
          return mapData;
        }
        return null;
      } catch (error) {
        console.error(`Error loading map ${folder}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove null entries

    return NextResponse.json(maps);
  } catch (error) {
    console.error('Error fetching maps:', error);
    return NextResponse.json({ error: 'Failed to fetch maps' }, { status: 500 });
  }
} 