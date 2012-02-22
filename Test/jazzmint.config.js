JazzMint.defineConfig({

  specDir : './Spec',
  sourceDir : '../Source'

});

JazzMint.defineTestSuite('all',{

  quitWhenLoadFailure : true,

  queryString : {
    specFiles : 'random',
    sourceFiles : 'random'
  },

  specFiles : 'Formular_spec.js',
  sourceFiles : 'Formular.js'

});
