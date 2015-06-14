include Math

def value(x, t)
   px = 0.1*exp(x/(2*PI))*cos(x)+t
   py = 0.1*exp(x/(2*PI))*sin(x)+t*(sin(x)/(2*PI)+cos(x))/(cos(x)/(2*PI)-sin(x))
   "\\tkzDefPoint(#{px}, #{py}){}"
end

x = PI+6*PI+PI/6

puts value(x, -0.3)
puts value(x, 0)
puts value(x, 0.3)

