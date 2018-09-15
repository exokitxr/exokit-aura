//
//  bridging-Header.h
//  Exokit
//
//  Created by hyperandroid on 12/09/2018.
//  Copyright © 2018 WebMixedReality. All rights reserved.
//

#pragma once

#ifdef __cplusplus
extern "C" {
#endif

    JSGlobalContextRef JSObjectGetGlobalContext(JSObjectRef object);

#ifdef __cplusplus
}
#endif
