import os
import sys

PYTHON_LIB_DIR = '/usr/lib/python{}.{}'.format(sys.version_info[0], sys.version_info[1])
sys.path.append(PYTHON_LIB_DIR)
sys.path.append(PYTHON_LIB_DIR+'/lib-dynload')
sys.path.append(PYTHON_LIB_DIR+'/site-packages')

#jank xml fix, hopefully not needed forever :)
sys.path.append(f"{PYTHON_LIB_DIR}/xml/")

# append py_modules to PYTHONPATH
sys.path.append(os.path.dirname(os.path.realpath(__file__))+"/py_modules")

import logging

logging.basicConfig(filename="/tmp/decky-kiwix.log",
                    format='[Decky-Kiwix] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.DEBUG) # can be changed to logging.DEBUG for debugging issues

import pathlib
HOMEBREW_DIR = str(pathlib.Path(__file__).parents[2])

# TODO: find all installed ZIMs
import requests, json
#from xml.etree import ElementTree as ET
from etree import ElementTree as ET
import re
import hashlib
from math import ceil, floor
import time
import traceback
import threading

url = "https://library.kiwix.org"
download_location = f"{HOMEBREW_DIR}/kiwix/"
plugin_folder = f"{HOMEBREW_DIR}/plugins/decky-kiwix/"

downloads = {}

def find_languages():
    language_names = {}

    r = requests.get(f"{url}/catalog/v2/languages")
    root = ET.fromstring(r.content)
    for child in root.iterfind('{http://www.w3.org/2005/Atom}entry'):
        if child.find("{http://purl.org/dc/terms/}language").text != None and child.find("{http://purl.org/dc/terms/}language").text != "Fra":
            language_names[child.find('{http://www.w3.org/2005/Atom}title').text] = child.find("{http://purl.org/dc/terms/}language").text
    return language_names

def find_categories():
    all_categories = set()
    r = requests.get(f"{url}/catalog/v2/categories")
    root = ET.fromstring(r.content)
    for child in root.iterfind('{http://www.w3.org/2005/Atom}entry'):
        all_categories.add(child.find('{http://www.w3.org/2005/Atom}title').text)
    return list(all_categories)

def find_zims(language='all', category='all', search=None):
    perams = {'count':-1,"notag":"_sw:yes"}

    if language != "all":
        perams['lang'] = language

    if category != "all":
        perams['tag'] = f"_category:{category}"

    if search != None:
        perams['q'] = search


    r = requests.get(f"{url}/catalog/search", params=perams)
    root = ET.fromstring(r.content)

    found_ZIMs = []
    total_results = int(root.find('{http://www.w3.org/2005/Atom}totalResults').text)


    for child in root.findall('{http://www.w3.org/2005/Atom}entry'):
        data = {}
        data['title'] = child.find('{http://www.w3.org/2005/Atom}title').text
        data['language'] = child.find('{http://www.w3.org/2005/Atom}language').text
        data['category'] = child.find('{http://www.w3.org/2005/Atom}category').text

        if child.find('{http://www.w3.org/2005/Atom}summary').text != "-":
            data['description'] = child.find('{http://www.w3.org/2005/Atom}summary').text
        else:
            data['description'] = None

        for link in child.iterfind('{http://www.w3.org/2005/Atom}link'):
            if link.get('type') == "application/x-zim":
                data['metalink'] = link.get('href')
                data['size'] = int(link.get('length'))
            if link.get('rel') == "http://opds-spec.org/image/thumbnail":
                data['image'] = link.get('href')

        tags = child.find('{http://www.w3.org/2005/Atom}tags').text
        data['images'] = re.search("(?:_pictures:)(\S{2,3})(?:;|$)", tags).group(1)
        data['videos'] = re.search("(?:_videos:)(\S{2,3})(?:;|$)", tags).group(1)

        found_ZIMs.append(data)
    return(found_ZIMs)


def download_file(metalink):
    global downloads
    logger.info(f"starting download of {metalink}")
    r = requests.get(metalink)
    root = ET.fromstring(r.content)
    info = root.find("{urn:ietf:params:xml:ns:metalink}file")
    filename = info.get('name')
    full_size = int(info.find("{urn:ietf:params:xml:ns:metalink}size").text)


    # TODO: maybe use at end to verify file is correct
    full_hashes = {}
    for full_hash in info.iterfind("{urn:ietf:params:xml:ns:metalink}hash"):
        full_hashes[full_hash.get('type')] = full_hash.text

    chunk_hashes = []
    chunks = info.find('{urn:ietf:params:xml:ns:metalink}pieces')
    chunk_size = int(chunks.get('length'))
    for chunk in chunks:
        chunk_hashes.append(chunk.text)

    # TODO: find the best url better, currently just grabs the top link
    url = info.find('{urn:ietf:params:xml:ns:metalink}url').text

    local_filename = f"{download_location}{filename}"
    logger.info(f"starting download of {filename} via {url}")

    if os.path.exists(local_filename):
        chunkNum = floor(os.stat(local_filename).st_size / chunk_size)
        logger.info(f"file already exists, starting at chunk {chunkNum} of {ceil(full_size/chunk_size)}")
    else:
        chunkNum = 0

    downloads[metalink] = floor((chunkNum/(full_size/chunk_size))*100)

    while chunkNum < ceil(full_size/chunk_size):
        resume_header = {'Range': f'bytes={chunkNum*chunk_size}-'} # download will continue if interrupted
        try:
            with requests.get(url, stream=True, timeout=(10, 50), headers=resume_header) as r:
                r.raise_for_status()
                with open(local_filename, 'ab') as f:
                    for chunk in r.iter_content(chunk_size=chunk_size):
                        downloads[metalink] = floor((chunkNum/(full_size/chunk_size))*100)
                        if hashlib.sha1(chunk).hexdigest() == chunk_hashes[chunkNum]:
                            logger.debug(f"Chunk {chunkNum+1} of {ceil(full_size/chunk_size)} ({ceil((chunk_size*chunkNum)/1024/1024)}MB/{ceil(full_size/1024/1024)}MB)")
                            f.write(chunk)
                        else:
                            logger.info(f"Chunk {chunkNum} failed hash check, retrying")
                            logger.info(f"{hashlib.sha1(chunk).hexdigest()} should be {chunk_hashes[chunkNum]}")
                            break
                        chunkNum += 1
        except requests.exceptions.ConnectionError: # runs when download times out
            logger.info(f"Chunk {chunkNum} timed out, retrying")
            time.sleep(5) # wait a bit before retrying
    # download is now done
    os.system(f'''"{plugin_folder}/kiwix-manage" "{download_location}"library.xml add "{download_location}"{filename}''')
    downloads[metalink] = 100
    logger.info(f"Download of {metalink} is complete")

def delete_file(filename):
    os.remove(f'"{download_location}/{filename}"')
    os.system(f'''"{plugin_folder}/kiwix-manage" "{download_location}"library.xml remove {filename}''')

def host_library():
    os.system(f'''"{plugin_folder}/kiwix-serve" -p 60918 --library "{download_location}"library.xml''')

# TODO: deal with me laterer
def installed_zims():
    print(os.listdir(download_location))

class Plugin:
    # kiwix tools available at https://download.kiwix.org/release/kiwix-tools/kiwix-tools_linux-x86_64.tar.gz
    # https://library.kiwix.org/catalog/v2/root.xml has helpful info :)

    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
    async def frontend_host_library(self):
        logger.info("Starting up library at port 60918")
        libraryThread.start()

    async def frontend_kill_library(self):
        logger.info("Killing library at port 60918")
        libraryThread.terminate()

    async def frontend_download_file(self, metalink):
        logger.info(f"Attempting download of {metalink}")
        x = threading.Thread(target=download_file, args=[metalink], daemon=True)
        x.start()

    async def frontend_download_progress(self, metalink):
        return downloads[metalink]

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        global libraryThread
        logger.info("Hello World!")
        libraryThread = threading.Thread(target=host_library, daemon=True)

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        logger.info("Goodbye World!")
        pass


#find_categories()
#find_languages()
#all_ZIMs = find_zims()
#print(all_categories)
#print(all_languages)
#download_file("https://download.kiwix.org/zim/other/archlinux_en_all_nopic_2022-12.zim.meta4")
#host_library()
