Pod::Spec.new do |s|
  s.name           = 'SykamoreUi'
  s.version        = '1.0.0'
  s.summary        = 'SwiftUI wrapper components for Vohrad'
  s.description    = 'SwiftUI wrapper components for Vohrad mobile app'
  s.author         = 'Vohrad'
  s.homepage       = 'https://github.com/Vohrad-xa/vohrad_frontend'
  s.platforms      = {
    :ios => '15.1',
    :tvos => '15.1'
  }
  s.swift_version  = '6.2'
  s.source         = { git: 'https://github.com/Vohrad-xa/vohrad_frontend' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
