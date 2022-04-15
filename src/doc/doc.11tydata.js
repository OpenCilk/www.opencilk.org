module.exports = {
    eleventyComputed: {
      eleventyNavigation: {
        key: data => data.title
      },
      sidebar: 'toc',
      background: 'bg-white'
    }
  };