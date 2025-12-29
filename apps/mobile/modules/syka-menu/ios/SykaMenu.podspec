Pod::Spec.new do |s|
  s.name           = 'SykaMenu'
  s.version        = '1.0.0'
  s.summary        = 'Native menu components for Sykamore'
  s.description    = 'Native menu components for Sykamore mobile app'
  s.author         = 'Sykamore'
  s.homepage       = 'https://github.com/amnabbouti/sykamore_frontend'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/amnabbouti/sykamore_frontend' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
