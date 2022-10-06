# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'OpenCilk'
copyright = '2022, The OpenCilk Team'
author = 'The OpenCilk Team'
release = '2.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    'sphinx.ext.mathjax',
    'sphinx_design',
]

templates_path = ['_templates']
exclude_patterns = []



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'pydata_sphinx_theme'

html_theme_options = {
  "logo": {
      "image_light": "OpenCilk-icon-330.png",
      "image_dark": "OpenCilk-icon-330.png",
  },
  "github_url": "https://github.com/opencilk/",
  "collapse_navigation": True,
}

html_static_path = ['_static']
html_css_files = [
    'css/custom.css',
]