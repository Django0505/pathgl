pathgl.fragment = [ "precision mediump float;"
                  , "uniform vec4 rgb;"
                  , "uniform float time;"
                  , "uniform vec2 resolution;"
                  , "void main(void) {"
                  , "  gl_FragColor = rgb;"
                  , "}"
                  ].join('\n')

pathgl.vertex = [ "attribute vec3 aVertexPosition;"
                , "uniform mat4 uPMatrix;"
                , "uniform vec2 xy;"
                , "uniform vec2 resolution;"
                , "uniform vec2 rotation;"
                , "uniform vec2 scale;"

                , "void main(void) {"

                , "vec3 scaled_position = aVertexPosition * vec3(scale, 1.0);"

                , "vec2 rotated_position = vec2(scaled_position.x * rotation.y + scaled_position.y * rotation.x, "
                                              + "scaled_position.y * rotation.y - scaled_position.x * rotation.x);"

                , "vec2 position = vec2(rotated_position.x +xy.x, rotated_position.y + xy.y );"

                , "vec2 zeroToOne = position / resolution;"
                , "vec2 zeroToTwo = zeroToOne * 2.0;"
                , "vec2 clipSpace = zeroToTwo - 1.0;"

                , "gl_Position = vec4(clipSpace, 1, 1);"

                , "}"
                ].join('\n')
