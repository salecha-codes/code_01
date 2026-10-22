#!/usr/bin/env bash
# Reproducible local setup for this Linux x86_64 cloud workspace.
# It creates no cloud services and never pushes, deploys, or publishes anything.
set -euo pipefail
cd /workspace/code_01
npm ci --cache /workspace/.npm-cache
python3 - <<'PY'
import hashlib
import json
import os
from pathlib import Path
import secrets
import shutil
import tarfile
import urllib.request

binary = Path('/workspace/.cache/mongodb-binaries/mongod-official-7.0.24')
expected_binary = 'f7a83a69c86654e690919d207a85b24098f98815e99f1767daff4d6b1acc297b'
manifest_digest = 'sha256:e9d31be73d55a03ffd4434a3dd75d9357bc6bd32f788e9bb3d1e5c39fb2b148b'
layer_digest = 'sha256:7e0c5d7b3228f784467663a56ccc63a190e46b14e5be0ed6a37efc7d2a003ce0'

def checksum(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()

if binary.exists():
    if checksum(binary) != expected_binary:
        raise RuntimeError('Existing MongoDB binary does not match verified provenance; inspect it before replacing.')
else:
    # Official Docker Library distribution, used only as a verified binary source.
    # No Docker daemon, containers, cloud account, or paid service is used.
    token_url = 'https://auth.docker.io/token?service=registry.docker.io&scope=repository:library/mongo:pull'
    with urllib.request.urlopen(token_url, timeout=30) as response:
        token = json.load(response)['token']
    headers = {'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.oci.image.manifest.v1+json, application/vnd.docker.distribution.manifest.v2+json'}
    request = urllib.request.Request('https://registry-1.docker.io/v2/library/mongo/manifests/' + manifest_digest, headers=headers)
    with urllib.request.urlopen(request, timeout=60) as response:
        manifest_bytes = response.read()
    if 'sha256:' + hashlib.sha256(manifest_bytes).hexdigest() != manifest_digest:
        raise RuntimeError('Official manifest checksum mismatch.')
    manifest = json.loads(manifest_bytes)
    layer = next(item for item in manifest['layers'] if item['digest'] == layer_digest)
    binary.parent.mkdir(parents=True, exist_ok=True)
    archive_path = binary.parent / 'official-mongo-7.0.24.download'
    request = urllib.request.Request('https://registry-1.docker.io/v2/library/mongo/blobs/' + layer_digest, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=60) as response, archive_path.open('wb') as destination:
            shutil.copyfileobj(response, destination)
        if archive_path.stat().st_size != layer['size'] or 'sha256:' + checksum(archive_path) != layer_digest:
            raise RuntimeError('Official MongoDB layer checksum mismatch.')
        temporary_binary = binary.with_suffix('.verified-download')
        with tarfile.open(archive_path, 'r:gz') as archive:
            member = archive.getmember('usr/bin/mongod')
            if not member.isfile():
                raise RuntimeError('Expected a regular mongod binary.')
            with archive.extractfile(member) as source, temporary_binary.open('wb') as destination:
                shutil.copyfileobj(source, destination)
        if checksum(temporary_binary) != expected_binary:
            temporary_binary.unlink()
            raise RuntimeError('Extracted binary checksum mismatch.')
        temporary_binary.chmod(0o755)
        temporary_binary.replace(binary)
    finally:
        archive_path.unlink(missing_ok=True)

# Preserve existing user configuration. Never embed a credential into tracked files.
env_file = Path('server/.env')
if not env_file.exists():
    settings = {
        'NODE_ENV': 'development', 'PORT': '5000',
        'MONGODB_URI': 'mongodb://127.0.0.1:27017/clubpulse',
        'JWT_SECRET': secrets.token_hex(48),
        'CLIENT_ORIGIN': 'http://localhost:5173', 'COOKIE_SAME_SITE': 'lax',
        'MONGOMS_SYSTEM_BINARY': str(binary),
        'MONGOMS_DOWNLOAD_DIR': str(binary.parent),
        'CLUBPULSE_DB_PATH': '/workspace/.clubpulse/mongo',
    }
    with env_file.open('x', opener=lambda path, flags: os.open(path, flags, 0o600)) as output:
        output.write(''.join(name + '=' + value + '\n' for name, value in settings.items()))
print('Verified MongoDB binary and preserved/initialized ignored local configuration.')
PY
/workspace/.cache/mongodb-binaries/mongod-official-7.0.24 --version
npm run build
