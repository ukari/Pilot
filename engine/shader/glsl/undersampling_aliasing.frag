#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp vec3 color = subpassLoad(in_color).rgb;
    const highp float undersampling = 4.0f;
    highp vec2 pos = (gl_FragCoord.xy - 0.5f) / undersampling + (undersampling - 1.0f) / 2.0f;
    if (abs(pos.x - gl_FragCoord.x) < 1e5 && abs(pos.y - gl_FragCoord.y) < 1e5) {
        out_color = vec4(color, 1.0f);
    } else {
        out_color = vec4(vec3((color.r + color.g + color.b) / 3.0f), 1.0f);
    }
}
