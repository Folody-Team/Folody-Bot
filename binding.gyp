{
  'targets': [{
    'target_name': 'suspend',
    'include_dirs': ['node_modules/node-addon-api'],
    'conditions': [
      ['OS=="win"', {
        'sources': [''],
      }],
    ],
    'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
  }],
}