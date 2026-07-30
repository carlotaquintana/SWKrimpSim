
# SWKrimpSim: Structural similarity of RDF graphs using frequent pattern mining

## Content of the repository

Source code of the approach for a structural similarity of RDF graphs based on frequent patterns, and its related experiments. In this project, it is included the code for the proposal to evaluate the evolution of a dataset already accepted at SWJ (see citations).   

+ The [SWPattern folder](https://github.com/MaillPierre/SWKrimpSim/tree/master/SWPattern) contains the source code for the conversion of RDF datasets and updates to transaction, and their comparison and evaluation using codetables. 

+ The [Scripts folder](https://github.com/MaillPierre/SWKrimpSim/tree/master/scripts) contains the scripts used to retrieve code tables from Vreeken's implementations of KRIMP and SLIM.

+ The [Slim archive](https://github.com/MaillPierre/SWKrimpSim/blob/master/SlimBinSource-20120607mod.tar.gz) contains our modification of Vreeken's SLIM implementation to be able to handle very large number of items (by removing a hard coded limit).

+ The [PythonCode folder](https://github.com/MaillPierre/SWKrimpSim/tree/master/pythonCode) contains the code used for the data analysis relative to our experiments.

## Running the SLIM Docker image

A Docker image is provided to execute the modified SLIM implementation without installing its dependencies.

### Build the image

```bash
docker build -t swkrimpsim-slim .
```

### Run SLIM

```bash
docker run --rm --user $(id -u):$(id -g) -v "$(pwd)":/work swkrimpsim-slim <database_name>
```

where `<database_name>` is the name of the input dataset **without** the `.dat` extension. For example, if the input file is `WktEN.dat`, execute:

```bash
docker run --rm --user $(id -u):$(id -g) -v "$(pwd)":/work swkrimpsim-slim WktEN
```

The input `.dat` file must be located in the current working directory.

### Output

After the execution finishes, all generated files are stored in:

```text
results/<database_name>-output/
```

This directory contains the generated code table (`.ct`), reports (`.csv`), the converted database (`.db`), the database analysis file, and a copy of the input dataset.

If the input database name contains dots (e.g., `my.dataset.v1.dat`), they are handled automatically during execution and restored in the output filenames.

### Removing the Docker image

If the Docker image is no longer needed, it can be removed with:

```bash
docker rmi swkrimpsim-slim
```

### Notes

* The container is executed using the current user (`--user $(id -u):$(id -g)`), so the generated files can be modified or removed without administrator/root privileges.
* The `--rm` option automatically removes the container after the execution finishes.
* The current directory is mounted inside the container as `/work`, allowing the input datasets and output files to be shared with the host system.


## Citation

To cite the structural similarity measure related to this approach:
```
@inproceedings{Maillot2018, 
    author = {Pierre Maillot and Carlos Bobed}, 
    title = {Measuring Structural Similarity Between RDF Graphs}, 
    booktitle = {Proc. of 33rd ACM/SIGAPP Symposium On Applied Computing (SAC), SWA track}, 
    publisher={ACM}, 
    pages = {1960--1967}, 
    month = {April}, 
    year = {2018}, 
}
```

To cite the assessment of the structural evolution of RDF (Knowledge) graphs: 
```
@article{Bobed2019,
    author={Carlos Bobed and Pierre Maillot and Peggy Cellier and S\'ebastien Ferr\'e},
    journal={Semantic Web},
    month={January},
    number={1},
    pages={831--853},
    publisher={IOS Press, ISSN 1570-0844},
    title={Data-driven Assessment of Structural Evolution of RDF Graphs},
    year={2020}
}
``` 

