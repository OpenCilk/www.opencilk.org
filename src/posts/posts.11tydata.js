module.exports = {
    eleventyComputed: {
      eleventyNavigation: {
        key: data => data.title,
        parent: 'Blog'
      },
      sidebar: 'toc'
    }
  };