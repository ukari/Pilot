#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp vec3 color = subpassLoad(in_color).rgb;
    /*const highp float undersampling = 9.0f;
    highp vec2 pos = gl_FragCoord.xy - 0.5f - mod(gl_FragCoord.xy - 0.5f, vec2(undersampling)) + floor((gl_FragCoord.xy - 0.5f) / undersampling) + (undersampling - 1.0f) / 2.0f;
    if (floor(mod(gl_FragCoord.x - 0.5f, undersampling)) < undersampling / 2.0f + 1e8) {
    //if (gl_FragCoord.x < 700.0f) {
        out_color = vec4(vec3(0.0f), 1.0f);
    } else {
        out_color = vec4(vec3(1.0f), 1.0f);//vec4(vec3((color.r + color.g + color.b) / 3.0f), 1.0f);
    }*/

    //out_color =vec4(mix(gl_FragCoord.x/1920.f, color.x, 0.5f), gl_FragCoord.y/1080.f, (gl_FragCoord, color.z, 0.5f), 1.0f);
    out_color = vec4(pow(vec3(color.rgb), vec3(2.2f)), 1.0f);
}
